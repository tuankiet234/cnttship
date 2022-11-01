import { TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { createRecord, deleteRecord, query, updateRecord } from 'thin-backend'
import { useQuery } from 'thin-backend-react'
import { useState } from 'react'
import Schema from 'async-validator'
import GridHeaderCommand from './components/GridHeaderCommand'
import GridCellCommand from './components/GridCellCommand'
import GridDrawer from './components/GridDrawer'

export default function Category() {
  const rows = useQuery(query('categories'))
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      headerAlign: 'center',
      disableColumnMenu: true,
    },
    {
      field: 'id',
      headerAlign: 'center',
      disableColumnMenu: true,
      sortable: false,
      width: 150,
      renderHeader: (v) => (
        <GridHeaderCommand
          onClick={() => openDrawer({ name: '' })}
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
  }>({ name: '' })

  const [fields, setFields] = useState<any>({})
  const validator = new Schema({
    name: {
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
      await createRecord('categories', item)
    //update
    else await updateRecord('categories', item.id, item)

    setDrawer(false)
  }

  const handleDeleteClick = async (id: string) => {
    if (
      // eslint-disable-next-line no-restricted-globals
      !confirm('Do you want to delete this record?')
    )
      return

    if (id === undefined) return

    await deleteRecord('categories', id)
  }

  return (
    <>
      <Typography variant="h4" mb={2}>
        Category
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
      </GridDrawer>
    </>
  )
}
