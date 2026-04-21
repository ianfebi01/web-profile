export const isPayloadReady = () => {
  return Boolean(process.env.PAYLOAD_SECRET && process.env.DATABASE_URL)
}
