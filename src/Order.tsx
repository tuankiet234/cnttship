import { IconButton, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { createRecord, deleteRecord, query, updateRecord } from 'thin-backend'
import { useQuery } from 'thin-backend-react'
import { useState } from 'react'
import Schema from 'async-validator'
import GridHeaderCommand from './components/GridHeaderCommand'
import GridCellCommand from './components/GridCellCommand'
import GridDrawer from './components/GridDrawer'
import SelectComponent from './components/SelectComponent'
import { KeyboardTab } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function Category() {
  const rows = useQuery(query('orders').orderByDesc('createdAt'))
  const shops = useQuery(query('shops'))
  const navigate = useNavigate()
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      headerAlign: 'center',
      disableColumnMenu: true,
    },
    {
      field: 'shopId',
      headerName: 'Shop',
      flex: 1,
      headerAlign: 'center',
      disableColumnMenu: true,
      renderCell: ({ value }) => shops?.find((s) => s.id === value)?.name,
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      headerAlign: 'center',
      disableColumnMenu: true,
    },
    {
      field: 'detail',
      headerName: 'Detail',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      disableColumnMenu: true,
      renderCell: ({ value, row }) => (
        <IconButton
          color="primary"
          onClick={() => navigate('/order/' + row.id)}
        >
          <KeyboardTab></KeyboardTab>
        </IconButton>
      ),
    },
    {
      field: 'id',
      headerAlign: 'center',
      disableColumnMenu: true,
      sortable: false,
      width: 150,
      renderHeader: (v) => (
        <GridHeaderCommand
          onClick={() => openDrawer({ name: '', shopId: '' })}
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
    shopId: string
  }>({ name: '', shopId: '' })

  const [fields, setFields] = useState<any>({})
  const validator = new Schema({
    name: {
      type: 'string',
      required: true,
    },
    shopId: {
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
      clearValidation()
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
      await createRecord('orders', item)
    //update
    else await updateRecord('orders', item.id, item)

    setDrawer(false)
  }

  const handleDeleteClick = async (id: string) => {
    if (
      // eslint-disable-next-line no-restricted-globals
      !confirm('Do you want to delete this record?')
    )
      return

    if (id === undefined) return

    await deleteRecord('orders', id)
  }

  return (
    <>
      <Typography variant="h4" mb={2}>
        Order
      </Typography>
      <DataGrid
        rows={rows ?? []}
        columns={columns}
        loading={rows === null}
        autoHeight
        disableSelectionOnClick
        showCellRightBorder
        showColumnRightBorder
      />

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
        <SelectComponent
          id="form-select-shop"
          items={shops ?? []}
          label="Shop"
          value={item.shopId}
          onChange={(val) => setItem({ ...item, shopId: val as string })}
          onBlur={() => validate()}
          error={fields.shopId !== undefined}
          helperText={fields.shopId}
        ></SelectComponent>
      </GridDrawer>
    </>
  )
}
