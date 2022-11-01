import { Delete, Edit } from '@mui/icons-material'
import { IconButton } from '@mui/material'

type GridCellCommandProps = {
  onUpdateClick: () => void
  onDeleteClick: () => void
}

export default function GridCellCommand(props: GridCellCommandProps) {
  return (
    <>
      <IconButton onClick={props.onUpdateClick}>
        <Edit></Edit>
      </IconButton>
      <IconButton color="error" onClick={props.onDeleteClick}>
        <Delete></Delete>
      </IconButton>
    </>
  )
}
