export default function getJwtTokenPayload(jwt: string) {
  const payloadStr = jwt.split('.')[1];
  try {
    const payload = JSON.parse(atob(payloadStr));
    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
}
