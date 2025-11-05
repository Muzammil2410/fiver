import Button from './Button'

export default {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
}

export const Primary = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
}

export const Secondary = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
}

export const Ghost = {
  args: {
    children: 'Button',
    variant: 'ghost',
  },
}

export const Danger = {
  args: {
    children: 'Button',
    variant: 'danger',
  },
}

export const Loading = {
  args: {
    children: 'Loading...',
    loading: true,
  },
}

export const FullWidth = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
}

export const Disabled = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

