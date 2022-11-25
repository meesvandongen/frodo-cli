import cp from 'child_process';
import { promisify } from 'util';
import { node14Compatibility } from '../utils/utils.js';

node14Compatibility();

const exec = promisify(cp.exec);
const CMD = 'frodo script import --help';
const { stdout } = await exec(CMD);

test("CLI help interface for 'script import' should be expected english", async () => {
  expect(stdout).toMatchSnapshot();
});
