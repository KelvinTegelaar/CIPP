import CippPageCard from '../../../src/components/CippCards/CippPageCard'

export default {
  title: 'Components/CippCards/CippPageCard',
  component: CippPageCard,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    title: 'Page Title',
    children: <p>Main page content goes here.</p>,
  },
}

export const WithInfoBar = {
  args: {
    title: 'Users Overview',
    infoBar: <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 4 }}>Stats here</div>,
    children: <p>User list content goes here.</p>,
  },
}

export const HiddenTitle = {
  args: {
    title: 'Hidden Title Page',
    hideTitleText: true,
    children: <p>The title is not shown above this card.</p>,
  },
}
