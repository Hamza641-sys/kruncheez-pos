const LOGO_URL = "https://raw.githubusercontent.com/Hamza641-sys/kruncheez-pos/2d3001fc6dcd60cb48032b924788cc86f8012ff0/ChatGPT%20Image%20Sep%2023%2C%202026%2C%2007_33_04%20AM.png"

export default function KruncheezLogo({ size = 'md' }) {
  const sizes = {
    xs:  60,
    sm:  130,
    md:  180,
    lg:  260,
    xl:  340,
  }
  const w = sizes[size] || 180

  return (
    <img
      src={LOGO_URL}
      alt="The Kruncheez"
      width={w}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}
