import cp from 'child_process';
import { promisify } from 'util';

const exec = promisify(cp.exec);
const CMD = 'frodo esv secret version deactivate --help';
const { stdout } = await exec(CMD);

test("CLI help interface for 'esv secret version deactivate' should be expected english", async () => {
  expect(stdout).toMatchSnapshot();
});
