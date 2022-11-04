import { Drawer, IconButton, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { createRecord, deleteRecord, query, updateRecord } from 'thin-backend'
import { useQuery } from 'thin-backend-react'
import { useState } from 'react'
import Schema from 'async-validator'
import GridHeaderCommand from './components/GridHeaderCommand'
import GridCellCommand from './components/GridCellCommand'
import GridDrawer from './components/GridDrawer'
import SelectComponent from './components/SelectComponent'
import { Close } from '@mui/icons-material'

export default function Item() {
  const [shopId, setShopId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const rows = useQuery(query('items').orderBy('createdAt'))
  const shops = useQuery(query('shops').orderBy('createdAt'))
  const categories = useQuery(query('categories').orderBy('createdAt'))
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      headerAlign: 'center',
      disableColumnMenu: true,
    },
    {
      field: 'categoryId',
      headerName: 'Category',
      flex: 1,
      headerAlign: 'center',
      disableColumnMenu: true,
      renderCell: ({ value }) => categories?.find((c) => c.id === value)?.name,
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      disableColumnMenu: true,
      type: 'number',
    },
    {
      field: 'id',
      headerAlign: 'center',
      disableColumnMenu: true,
      sortable: false,
      width: 150,
      renderHeader: (v) => (
        <GridHeaderCommand
          onClick={() => openDrawer({ name: '', price: 0, shopId, categoryId })}
        ></GridHeaderCommand>
      ),
      renderCell: ({ value, row }) => (
        <GridCellCommand
          onUpdateClick={() => openDrawer(row)}
          onDeleteClick={() => handleDeleteClick(value)}
        ></GridCellCommand>
      ),
      align: 'center',
    },
  ]

  const [drawer, setDrawer] = useState(false)
  const [item, setItem] = useState<{
    id?: string
    name: string
    price: number
    shopId: string
    categoryId: string
  }>({ name: '', price: 0, shopId: '', categoryId: '' })

  const [fields, setFields] = useState<any>({})
  const validator = new Schema({
    name: {
      type: 'string',
      required: true,
    },
    price: {
      type: 'number',
      required: true,
    },
    shopId: {
      type: 'string',
      required: true,
    },
    categoryId: {
      type: 'string',
      required: true,
    },
  })

  const openDrawer = (row: any) => {
    clearValidation()
    setItem(row)
    setDrawer(true)
  }

  const validate = async () => {
    try {
      await validator.validate(item)
      return true
    } catch (e: any) {
      const result: any = {}
      e.errors.forEach((f: any) => (result[f.field] = f.message))
      setFields(result)
      return false
    }
  }
  const clearValidation = () => {
    setFields({})
  }

  const handleSave = async () => {
    if (!(await validate())) return

    if (item.id === undefined)
      //create
      await createRecord('items', item)
    //update
    else await updateRecord('items', item.id, item)

    setDrawer(false)
  }

  const handleDeleteClick = async (id: string) => {
    if (
      // eslint-disable-next-line no-restricted-globals
      !confirm('Do you want to delete this record?')
    )
      return

    if (id === undefined) return

    await deleteRecord('items', id)
  }

  return (
    <>
      <Typography variant="h4" mb={2}>
        Item
      </Typography>
      <SelectComponent
        id="select-shop"
        items={shops ?? []}
        label="Shop"
        value={shopId}
        sx={{ minWidth: 200, mb: 2, mr: 2 }}
        onChange={(val) => setShopId(val as string)}
      ></SelectComponent>
      <SelectComponent
        id="select-category"
        items={categories ?? []}
        label="Category"
        value={categoryId}
        sx={{ minWidth: 200, mb: 2 }}
        startAdornment={
          <IconButton onClick={() => setCategoryId('')}>
            <Close></Close>
          </IconButton>
        }
        onChange={(val) => setCategoryId(val as string)}
      ></SelectComponent>

      {shopId === '' ? (
        ''
      ) : (
        <DataGrid
          rows={
            rows?.filter(
              (r) =>
                r.shopId === shopId &&
                (categoryId === '' || r.categoryId === categoryId)
            ) ?? []
          }
          columns={columns}
          loading={rows === null}
          autoHeight
          disableSelectionOnClick
          showCellRightBorder
          showColumnRightBorder
        />
      )}

      <GridDrawer
        title={item.id === undefined ? 'Create' : 'Update'}
        open={drawer}
        onClose={() => setDrawer(false)}
        onSave={() => handleSave()}
      >
        <TextField
          label="Name"
          required
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          onBlur={() => validate()}
          error={fields.name !== undefined}
          helperText={fields.name}
        ></TextField>
        <TextField
          label="Price"
          required
          value={item.price}
          onChange={(e) =>
            setItem({ ...item, price: parseInt(e.target.value) })
          }
          onBlur={() => validate()}
          error={fields.price !== undefined}
          helperText={fields.price}
          type="number"
        ></TextField>
        <SelectComponent
          id="form-select-shop"
          items={shops ?? []}
          label="Shop"
          value={item.shopId}
          onChange={(val) => setItem({ ...item, shopId: val as string })}
        ></SelectComponent>
        <SelectComponent
          id="form-select-category"
          items={categories ?? []}
          label="Category"
          value={item.categoryId}
          error={fields.categoryId !== undefined}
          helperText={fields.categoryId}
          onChange={(val) => setItem({ ...item, categoryId: val as string })}
        ></SelectComponent>
      </GridDrawer>
    </>
  )
}
