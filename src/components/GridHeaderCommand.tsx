import { Add } from '@mui/icons-material'
import { IconButton } from '@mui/material'

type GridHeaderCommandProps = {
  onClick: () => void
}

export default function GridHeaderCommand(props: GridHeaderCommandProps) {
  return (
    <IconButton color="primary" onClick={props.onClick}>
      <Add></Add>
    </IconButton>
  )
}
