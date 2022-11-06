import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Drawer,
  Grid,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid'
import {
  createRecord,
  deleteRecord,
  getCurrentUserId,
  Order,
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
import { Check, Close, Share } from '@mui/icons-material'
import moment from 'moment'
import _ from 'lodash'
import numeral from 'numeral'
import { useParams } from 'react-router-dom'

export default function Category() {
  const params = useParams()
  const orderId = params.id
  const rows = useQuery(query('orders').orderByDesc('createdAt'))
  const shops = useQuery(query('shops'))
  const users = useQuery(query('users'))
  const categories = useQuery(query('categories'))
  const [order, setOrder] = useState<Order | null>(null)
  const orderDetails = useQuery(query('order_details'))
  const orderUsers = useQuery(query('order_users'))
  const cafeItems = useQuery(query('items'))
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
      renderCell: ({ value }) => {
        const shop = shops?.find((s) => s.id === value)
        return `${shop?.name} (${shop?.phone})`
      },
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      disableColumnMenu: true,
      renderCell: ({ value }) => moment(value).format('DD/MM/YYYY'),
    },
    {
      field: 'id',
      headerAlign: 'center',
      disableColumnMenu: true,
      sortable: false,
      width: 100,
      renderHeader: (v) => (
        <GridHeaderCommand
          onClick={() => openDrawer({ name: '', shopId: '' })}
        ></GridHeaderCommand>
      ),
      renderCell: ({ value, row }) => (
        <>
          {userId !== row.userId ? (
            ''
          ) : (
            <GridCellCommand
              onUpdateClick={() => openDrawer(row)}
              onDeleteClick={() => handleDeleteClick(value)}
            ></GridCellCommand>
          )}
        </>
      ),
      align: 'center',
    },
  ]

  useEffect(() => {
    if (orderId === undefined) return

    const sharedOrder = rows?.find((r) => r.id === orderId)
    setOrder(sharedOrder ?? null)
  }, [orderId, rows])

  const [drawer, setDrawer] = useState(false)
  const [item, setItem] = useState<{
    id?: string
    name: string
    shopId: string
  }>({ name: '', shopId: '' })
  const userId = getCurrentUserId()

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

    if (item.id === undefined) {
      //create
      await createRecord('orders', item)
    }
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

  const handleOrderTableSelection = async (selection: GridSelectionModel) => {
    const orderId = selection[0] as string
    setOrder(rows?.find((r) => r.id === orderId) ?? null)
  }

  const handleChangeOrderUser = async (val: string[]) => {
    if (order === null || orderUsers === null) return
    const orderUserIds = orderUsers
      .filter((ou) => ou.orderId === order.id)
      .map((ou) => ou.userId)
    if (val.length < orderUserIds.length) {
      const [userId] = _.difference(orderUserIds, val)
      const id = orderUsers.find(
        (ou) => ou.orderId === order.id && ou.userId === userId
      )?.id

      if (id === undefined) return
      await deleteRecord('order_users', id)
    } else {
      const [userId] = _.difference(val, orderUserIds)
      await createRecord('order_users', {
        orderId: order.id,
        userId: userId,
      })
    }
  }

  const [orderDrawer, setorderDrawer] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [notify, setNotify] = useState(false)

  const handleOrderItemClick = async (id: string) => {
    if (order === null) return

    if (
      orderDetails
        ?.filter((od) => od.orderId === order.id && od.userId === userId)
        .some((od) => od.itemId === id)
    )
      return

    await createRecord('order_details', {
      orderId: order.id,
      userId,
      itemId: id,
    })
  }

  const handleDeleteOrderItem = async (id: string) => {
    if (order === null) return

    const orderDetail = orderDetails?.find(
      (od) =>
        od.orderId === order.id && od.userId === userId && od.itemId === id
    )

    if (orderDetail !== undefined)
      await deleteRecord('order_details', orderDetail.id)
  }

  const handleShareClick = (id: string) => {
    navigator.clipboard.writeText(
      _.trimEnd(window.location.href, '/#/order/') + '/#/order/' + id
    )
    setNotify(true)
  }

  return (
    <>
      <Typography variant="h4" mb={2}>
        Order
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={order === null ? 12 : 6}>
          <DataGrid
            rows={(rows ?? [])
              .filter(
                (r) =>
                  orderUsers
                    ?.filter((ou) => ou.userId === userId)
                    .map((ou) => ou.orderId)
                    .includes(r.id) || r.userId === userId
              )
              .filter((r) => orderId === undefined || r.id === orderId)}
            columns={columns}
            loading={rows === null}
            autoHeight
            showCellRightBorder
            showColumnRightBorder
            density="compact"
            sx={{ mb: 2 }}
            selectionModel={order?.id}
            onSelectionModelChange={handleOrderTableSelection}
          />
        </Grid>
        {order === null ? (
          ''
        ) : (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={order.name}
                action={
                  <IconButton onClick={() => handleShareClick(order.id)}>
                    <Share></Share>
                  </IconButton>
                }
              ></CardHeader>
              <CardContent>
                {userId === order.userId ? (
                  <SelectComponent
                    id="form-select-users"
                    items={users ?? []}
                    label="Order users"
                    value={
                      orderUsers
                        ?.filter((ou) => ou.orderId === order.id)
                        .map((ou) => ou.userId) ?? []
                    }
                    multiple
                    labelItem="email"
                    sx={{ width: 1 / 1 }}
                    onChange={(val) => handleChangeOrderUser(val as string[])}
                  ></SelectComponent>
                ) : (
                  ''
                )}
                <Table sx={{ width: 1 / 1 }}>
                  <TableHead>
                    <TableRow
                      sx={{ '.MuiTableCell-root': { fontWeight: 'bold' } }}
                    >
                      <TableCell>User</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users
                      ?.filter((u) =>
                        orderUsers
                          ?.filter((ou) => ou.orderId === order.id)
                          .map((ou) => ou.userId)
                          .includes(u.id)
                      )
                      .map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            {u.email.replace('@vnpt.vn', '')}
                          </TableCell>
                          <TableCell>
                            {cafeItems === null
                              ? ''
                              : cafeItems
                                  .filter(
                                    (ci) =>
                                      ci.shopId === order.shopId &&
                                      orderDetails
                                        ?.filter(
                                          (od) =>
                                            od.orderId === order.id &&
                                            od.userId === u.id
                                        )
                                        .map((od) => od.itemId)
                                        .includes(ci.id)
                                  )
                                  .map((ci) => ci.name)
                                  .join(', ')}
                            {u.id === userId ? (
                              <Button onClick={() => setorderDrawer(true)}>
                                (Order)
                              </Button>
                            ) : (
                              ''
                            )}
                          </TableCell>
                          <TableCell>
                            {cafeItems === null
                              ? ''
                              : numeral(
                                  _.sumBy(
                                    cafeItems.filter(
                                      (ci) =>
                                        ci.shopId === order.shopId &&
                                        orderDetails
                                          ?.filter(
                                            (od) =>
                                              od.orderId === order.id &&
                                              od.userId === u.id
                                          )
                                          .map((od) => od.itemId)
                                          .includes(ci.id)
                                    ),
                                    'price'
                                  )
                                ).format('0,0')}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow
                      sx={{
                        '.MuiTableCell-root': {
                          fontWeight: 'bold',
                          fontSize: '15px',
                        },
                      }}
                    >
                      <TableCell>Summary</TableCell>
                      <TableCell>
                        <ul>
                          {cafeItems === null
                            ? ''
                            : _.chain(
                                cafeItems.filter(
                                  (ci) =>
                                    ci.shopId === order.shopId &&
                                    orderDetails
                                      ?.filter(
                                        (od) =>
                                          od.orderId === order.id &&
                                          orderUsers
                                            ?.map((ou) => ou.userId)
                                            .includes(od.userId)
                                      )
                                      .map((od) => od.itemId)
                                      .includes(ci.id)
                                )
                              )
                                .groupBy('id')
                                .map((g, key) => (
                                  <li key={key}>
                                    {_.head(g)?.name}:{' '}
                                    {
                                      orderDetails?.filter(
                                        (od) =>
                                          od.orderId === order.id &&
                                          orderUsers
                                            ?.map((ou) => ou.userId)
                                            .includes(od.userId) &&
                                          od.itemId === key
                                      ).length
                                    }
                                  </li>
                                ))
                                .value()}
                        </ul>
                      </TableCell>
                      <TableCell>
                        {cafeItems === null
                          ? ''
                          : numeral(
                              _.sumBy(
                                cafeItems.filter(
                                  (ci) =>
                                    ci.shopId === order.shopId &&
                                    orderDetails
                                      ?.filter(
                                        (od) =>
                                          od.orderId === order.id &&
                                          orderUsers
                                            ?.map((ou) => ou.userId)
                                            .includes(od.userId)
                                      )
                                      .map((od) => od.itemId)
                                      .includes(ci.id)
                                ),
                                'price'
                              )
                            ).format('0,0')}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

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

      <Drawer
        anchor="bottom"
        open={orderDrawer}
        onClose={() => setorderDrawer(false)}
      >
        {order === null ? (
          <></>
        ) : (
          <Card>
            <Box sx={{ height: '70vh' }}>
              <CardHeader
                title={
                  <SelectComponent
                    id="select-category"
                    items={categories ?? []}
                    label="Category"
                    value={categoryId}
                    sx={{ minWidth: 200 }}
                    startAdornment={
                      <IconButton onClick={() => setCategoryId('')}>
                        <Close></Close>
                      </IconButton>
                    }
                    onChange={(val) => setCategoryId(val as string)}
                  ></SelectComponent>
                }
                action={
                  <IconButton onClick={() => setorderDrawer(false)}>
                    <Close></Close>
                  </IconButton>
                }
              ></CardHeader>
              <CardContent>
                <Typography component="h6" sx={{ textAlign: 'center', mb: 2 }}>
                  {cafeItems === null
                    ? ''
                    : cafeItems
                        .filter(
                          (i) =>
                            i.shopId === order.shopId &&
                            orderDetails
                              ?.filter(
                                (od) =>
                                  od.orderId === order.id &&
                                  od.userId === userId
                              )
                              .map((od) => od.itemId)
                              .includes(i.id)
                        )
                        .map((ci) => (
                          <Chip
                            key={ci.id}
                            label={ci.name}
                            onDelete={() => handleDeleteOrderItem(ci.id)}
                          />
                        ))}
                </Typography>
                <DataGrid
                  rows={
                    cafeItems === null
                      ? []
                      : cafeItems.filter(
                          (c) =>
                            c.shopId === order.shopId &&
                            (categoryId === '' || c.categoryId === categoryId)
                        )
                  }
                  columns={[
                    {
                      field: 'id',
                      headerName: 'Call',
                      headerAlign: 'center',
                      align: 'center',
                      disableColumnMenu: true,
                      width: 70,
                      sortable: false,
                      renderCell: ({ value }) => (
                        <IconButton
                          color="primary"
                          onClick={() => handleOrderItemClick(value)}
                        >
                          <Check></Check>
                        </IconButton>
                      ),
                    },
                    {
                      field: 'name',
                      headerName: 'Name',
                      flex: 1,
                      headerAlign: 'center',
                      disableColumnMenu: true,
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
                  ]}
                  autoHeight
                  showCellRightBorder
                  showColumnRightBorder
                  density="compact"
                  disableSelectionOnClick
                />
              </CardContent>
            </Box>
          </Card>
        )}
      </Drawer>

      <Snackbar
        open={notify}
        autoHideDuration={3000}
        onClose={() => setNotify(false)}
        message="Copied to clipboard"
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      />
    </>
  )
}
