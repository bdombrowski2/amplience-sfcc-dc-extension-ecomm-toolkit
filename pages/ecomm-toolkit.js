import dynamic from 'next/dynamic'


export default dynamic(
  () => import('../components/EcommToolkit/components/EcommToolkitFieldSelector/EcommToolkitFieldSelector'),
  { ssr: false }
)

