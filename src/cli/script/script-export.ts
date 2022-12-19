import { FrodoCommand } from '../FrodoCommand';
import { Option } from 'commander';
import { Authenticate, Script } from '@rockcarver/frodo-lib';
import { printMessage, verboseMessage } from '../../utils/Console';

const { getTokens } = Authenticate;
const { exportScriptByName } = Script;
const { exportScriptsToFile } = Script;
const { exportScriptsToFiles } = Script;
const { exportScriptsExtract } = Script;

const program = new FrodoCommand('frodo script export');

interface ScriptExportOptions extends common.CommonOptions {
  scriptName?: string;
  file?: string;
  all?: boolean;
  allSeparate?: boolean;
  /**
   * @deprecated
   */
  script?: string;
  extract: boolean;
}

program
  .description('Export scripts.')
  .addOption(
    new Option(
      '-n, --script-name <name>',
      'Name of the script. If specified, -a and -A are ignored.'
    )
  )
  // .addOption(
  //   new Option(
  //     '-i, --script-id <uuid>',
  //     'Uuid of the script. If specified, -a and -A are ignored.'
  //   )
  // )
  .addOption(new Option('-f, --file <file>', 'Name of the export file.'))
  .addOption(
    new Option(
      '-a, --all',
      'Export all scripts to a single file. Ignored with -n.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all scripts to separate files (*.script.json) in the current directory. Ignored with -n or -a.'
    )
  )
  // deprecated option
  .addOption(
    new Option(
      '-s, --script <script>',
      'DEPRECATED! Use -n/--script-name instead. Name of the script.'
    )
  )
  .addOption(
    new Option(
      '-x, --extract',
      'Extract the script from the exported file, and save it to a separate file. Ignored with -n or -a.'
    )
  )
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options, command) => {
      command.handleDefaultArgsAndOpts(
        host,
        realm,
        user,
        password,
        options,
        command
      );
      // export by name
      if ((options.scriptName || options.script) && (await getTokens())) {
        verboseMessage('Exporting script...');
        exportScriptByName(options.scriptName || options.script, options.file);
      }
      // -a / --all
      else if (options.all && (await getTokens())) {
        verboseMessage('Exporting all scripts to a single file...');
        exportScriptsToFile(options.file);
      }
      // -A / --all-separate
      else if (options.allSeparate && (await getTokens())) {
        verboseMessage('Exporting all scripts to separate files...');
        exportScriptsToFiles();
      }
      // -j / --js
      else if (options.extract) {
        verboseMessage('Exporting all scripts as js files...');
        await exportScriptsExtract();
      }
      // unrecognized combination of options or no options
      else {
        printMessage(
          'Unrecognized combination of options or no options...',
          'error'
        );
        program.help();
        process.exitCode = 1;
      }
    }
    // end command logic inside action handler
  );

program.parse();
