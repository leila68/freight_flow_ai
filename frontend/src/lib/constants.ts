export const equipmentTypes = [
  { value: 'dry_van',  label: 'Dry Van'        },
  { value: 'reefer',   label: 'Refrigerated'   },
  { value: 'flatbed',  label: 'Flatbed'        },
] as const

export const accessorialOptions = [
  'Liftgate Pickup',
  'Liftgate Delivery',
  'Residential Pickup',
  'Residential Delivery',
  'Inside Pickup',
  'Inside Delivery',
  'Limited Access',
  'Appointment Required',
  'Temperature Control',
  'Tarping',
  'Hazmat',
  'Team Drivers',
] as const