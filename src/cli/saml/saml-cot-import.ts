import { Command, Option } from 'commander';
import { Authenticate, CirclesOfTrust, state } from '@rockcarver/frodo-lib';
import * as common from '../cmd_common';
import { printMessage } from '../../utils/Console';

const { getTokens } = Authenticate;
const {
  importCircleOfTrust,
  importCirclesOfTrustFromFile,
  importCirclesOfTrustFromFiles,
  importFirstCircleOfTrust,
} = CirclesOfTrust;

const program = new Command('frodo saml cot import');

program
  .description('Import SAML circles of trust.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option(
      '-i, --cot-id <cot-id>',
      'Circle of trust id. If specified, only one circle of trust is imported and the options -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file <file>',
      'Name of the file to import the circle(s) of trust from.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Import all circles of trust from single file. Ignored with -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Import all circles of trust from separate files (*.cot.saml.json) in the current directory. Ignored with -i or -a.'
    )
  )
  .action(
    // implement program logic inside action handler
    async (host, realm, user, password, options) => {
      state.default.session.setTenant(host);
      state.default.session.setRealm(realm);
      state.default.session.setUsername(user);
      state.default.session.setPassword(password);
      state.default.session.setDeploymentType(options.type);
      state.default.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        // import by id
        if (options.file && options.cotId) {
          printMessage(
            `Importing circle of trust "${
              options.cotId
            }" into realm "${state.default.session.getRealm()}"...`
          );
          importCircleOfTrust(options.cotId, options.file);
        }
        // --all -a
        else if (options.all && options.file) {
          printMessage(
            `Importing all circles of trust from a single file (${options.file})...`
          );
          importCirclesOfTrustFromFile(options.file);
        }
        // --all-separate -A
        else if (options.allSeparate && !options.file) {
          printMessage(
            'Importing all circles of trust from separate files (*.saml.json) in current directory...'
          );
          importCirclesOfTrustFromFiles();
        }
        // import first provider from file
        else if (options.file) {
          printMessage(
            `Importing first circle of trust from file "${
              options.file
            }" into realm "${state.default.session.getRealm()}"...`
          );
          importFirstCircleOfTrust(options.file);
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...');
          program.help();
        }
      }
    }
    // end program logic inside action handler
  );

program.parse();
