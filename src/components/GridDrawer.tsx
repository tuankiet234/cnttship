import { Cancel, Close, Save } from '@mui/icons-material'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Drawer,
  Grid,
  IconButton,
} from '@mui/material'
import isArray from 'lodash/isArray'

type GridDrawerProps = {
  open: boolean
  title: string
  children: React.ReactNode[] | React.ReactNode
  onSave: () => void
  onClose: () => void
}

export default function GridDrawer(props: GridDrawerProps) {
  return (
    <Drawer anchor="bottom" open={props.open} onClose={props.onClose}>
      <Card>
        <Box sx={{ height: '90vh' }}>
          <CardHeader
            title={props.title}
            action={
              <IconButton onClick={props.onClose}>
                <Close></Close>
              </IconButton>
            }
          ></CardHeader>
          <CardContent>
            <Grid
              container
              spacing={2}
              sx={{
                '.MuiTextField-root': { width: 1 / 1 },
                '.MuiFormControl-root': { width: 1 / 1 },
              }}
            >
              {(isArray(props.children)
                ? props.children
                : [props.children]
              ).map((child, idx) => (
                <Grid key={idx} item xs={12} md={6}>
                  {child}
                </Grid>
              ))}
            </Grid>
          </CardContent>
          <CardActions>
            <Box sx={{ width: 1 / 1, textAlign: 'center' }}>
              <ButtonGroup variant="outlined">
                <Button onClick={props.onSave}>
                  <Save></Save>
                  Save
                </Button>
                <Button color="warning" onClick={props.onClose}>
                  <Cancel></Cancel>
                  Cancel
                </Button>
              </ButtonGroup>
            </Box>
          </CardActions>
        </Box>
      </Card>
    </Drawer>
  )
}
