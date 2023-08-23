import 'module-alias/register';
import DocuHubApiService from './app';

async function main() {
  const docuHubApiService = new DocuHubApiService();

  // Initialise service routes and middlewares
  await docuHubApiService.init();

  // Start service
  docuHubApiService.start();
}

main();
