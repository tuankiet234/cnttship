import { IconButton, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid'
import {
  createRecord,
  createRecords,
  deleteRecord,
  deleteRecords,
  query,
  updateRecord,
} from 'thin-backend'
import { useQuery } from 'thin-backend-react'
import { useEffect, useState } from 'react'
import Schema from 'async-validator'
import GridHeaderCommand from './components/GridHeaderCommand'
import GridCellCommand from './components/GridCellCommand'
import GridDrawer from './components/GridDrawer'
import SelectComponent from './components/SelectComponent'
import { ArrowBack, KeyboardTab } from '@mui/icons-material'
import { useParams, useRoutes, useNavigate } from 'react-router-dom'

export default function Category() {
  const params = useParams()
  const navigate = useNavigate()
  const orderId = params.id
  const [order, setOrder] = useState<any>({})
  useEffect(() => {
    if (orderId === undefined) return
    query('orders')
      .where('id', orderId)
      .fetchOne()
      .then((data) => setOrder(data))
  }, [orderId])

  const users = useQuery(query('users'))
  const rows = useQuery(query('orders').orderByDesc('createdAt'))
  const shops = useQuery(query('shops'))
  const columns: GridColDef[] = [
    {
      field: 'email',
      headerName: 'Name',
      flex: 1,
      headerAlign: 'center',
      disableColumnMenu: true,
    },
  ]

  const [test, setTest] = useState('')
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

  const handleSelection = async (selection: GridSelectionModel) => {
    if (orderId === undefined) return
    const orderUser = await query('order_users')
      .where('orderId', orderId)
      .fetch()
    await deleteRecords(
      'order_users',
      orderUser.map((o) => o.id)
    )

    await createRecords(
      'order_users',
      selection.map((s) => ({
        orderId,
        userId: s.toString(),
      }))
    )
  }

  return (
    <>
      <Typography variant="h4" mb={2}>
        <IconButton onClick={() => navigate('/Order')}>
          <ArrowBack></ArrowBack>
        </IconButton>
        Order {order?.name}
      </Typography>
      <DataGrid
        rows={users ?? []}
        columns={columns}
        loading={users === null}
        autoHeight
        disableSelectionOnClick
        showCellRightBorder
        showColumnRightBorder
        checkboxSelection
        onSelectionModelChange={handleSelection}
      />
      {/* <Typography variant="h4" mb={2}>
        Order Detail
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
      </GridDrawer> */}
    </>
  )
}
