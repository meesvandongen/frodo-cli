import cp from 'child_process';
import { promisify } from 'util';

const exec = promisify(cp.exec);
const CMD = 'frodo idm list --help';
const { stdout } = await exec(CMD);

test("CLI help interface for 'idm list' should be expected english", async () => {
  expect(stdout).toMatchSnapshot();
});
