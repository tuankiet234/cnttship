import { SxProps } from '@mui/joy/styles/types'
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { FunctionComponent } from 'react'

type SelectComponentProps = {
  id: string
  label: string
  value: string | number | string[] | number[]
  items: any[]
  labelItem?: string
  valueItem?: string | number
  error?: boolean
  helperText?: string
  sx?: SxProps
  fullWidth?: boolean
  multiple?: boolean
  startAdornment?: React.ReactNode
  onChange: (val: string | number | string[] | number[]) => void
  onBlur?: () => void
}

const SelectComponent: FunctionComponent<SelectComponentProps> = (props) => (
  <FormControl sx={props.sx ?? ({} as any)} error={props.error}>
    <InputLabel id={`${props.id}-label`}>{props.label}</InputLabel>
    <Select
      labelId={`${props.id}-label`}
      id={`${props.id}`}
      value={props.value}
      label={props.label}
      error={props.error ?? false}
      multiple={props.multiple ?? false}
      fullWidth={props.fullWidth ?? false}
      startAdornment={props.startAdornment ?? <></>}
      onChange={(e) => props.onChange(e.target.value)}
      onBlur={() => props.onBlur}
    >
      {props.items.map((i, idx) => (
        <MenuItem key={idx} value={i[props.valueItem ?? 'id']}>
          {i[props.labelItem ?? 'name']}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText>{props.helperText}</FormHelperText>
  </FormControl>
)

export default SelectComponent

// export default function SelectComponent(props: SelectComponentProps) {
//   return (
//     <FormControl error={props.error}>
//       <InputLabel id={`${props.id}-label`}>{props.label}</InputLabel>
//       <Select
//         labelId={`${props.id}-label`}
//         id={`${props.id}`}
//         value={props.value}
//         label={props.label}
//         error={props.error}
//         onChange={(e) => props.onChange(e.target.value)}
//       >
//         {props.items.map((i, idx) => (
//           <MenuItem key={idx} value={i[props.valueItem]}>
//             {props.labelItem}
//           </MenuItem>
//         ))}
//       </Select>
//       <FormHelperText>{props.helperText}</FormHelperText>
//     </FormControl>
//   )
// }
