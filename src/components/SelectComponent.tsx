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
  value: string | number
  items: any[]
  labelItem?: string
  valueItem?: string | number
  error?: boolean
  helperText?: string
  sx?: SxProps
  onChange: (val: string | number) => void
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
      onChange={(e) => props.onChange(e.target.value)}
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
