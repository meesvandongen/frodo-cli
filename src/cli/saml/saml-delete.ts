import { Authenticate, Saml2, state } from '@rockcarver/frodo-lib';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';

const { getTokens } = Authenticate;
const { deleteSamlEntityByEntityId } = Saml2;

const program = new Command('frodo saml delete');

program
  .description('Delete an SAML Entity.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option('-i, --id <id>', 'Id of SAML Entity.').makeOptionMandatory()
  )
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options) => {
      state.default.session.setTenant(host);
      state.default.session.setRealm(realm);
      state.default.session.setUsername(user);
      state.default.session.setPassword(password);
      state.default.session.setDeploymentType(options.type);
      state.default.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        if (options.id) {
          console.log(`Deleting SAML entity ...${options.id}`);
          deleteSamlEntityByEntityId(options.id).then((result) => {
            if (result !== null)
              console.log(`Deleted SAML entity ${options.id}`);
          });
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
