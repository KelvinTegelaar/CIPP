import { fn, within, expect, userEvent } from 'storybook/test'
import { CippImageCard } from '../../../src/components/CippCards/CippImageCard'

export default {
  title: 'Components/CippCards/CippImageCard',
  component: CippImageCard,
  tags: ['autodocs'],
  argTypes: {
    isFetching: { control: 'boolean' },
    onButtonClick: fn(),
    onClick: fn(),
  },
}

export const Default = {
  args: {
    title: 'Reports Illustration',
    text: 'This is a card showing reports and analytics.',
    imageUrl: '/assets/illustrations/undraw_lost_re_xqjt.svg',
    linkText: 'View Reports',
    link: '/reports',
  },
}

export const StepProgress = {
  args: {
    title: 'Onboarding Step',
    text: 'Please complete your company profile.',
    imageUrl: '/assets/illustrations/undraw_website_ij0l.svg',
    step: 2,
    maxstep: 5,
    linkText: 'Continue',
    link: '/onboarding',
  },
}

export const Loading = {
  args: {
    title: 'Loading Reports',
    isFetching: true,
    imageUrl: '/assets/illustrations/undraw_website_ij0l.svg',
  },
}

export const CustomButton = {
  args: {
    title: 'Action Card',
    text: 'This card triggers a custom action.',
    imageUrl: '/assets/illustrations/undraw_website_ij0l.svg',
    linkText: 'Click Me',
    onButtonClick: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('custom button click fires onButtonClick', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Click Me/i }))
      await expect(args.onButtonClick).toHaveBeenCalled()
    })
  },
}
