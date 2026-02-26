import { getHomePage } from '../utils/get-home-page';

async function main() {
  const data = await getHomePage('id');
  console.log(JSON.stringify(data, null, 2).slice(0, 3000));
}

main().catch(console.error);
