'use strict';

const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {getRandomInt, shuffle} = require(`../../utils`);
const {
  DEFAULT_COUNT,
  MAX_COUNT,
  FILE_NAME,
  FILE_CATEGORIES_PATH,
  FILE_TITLES_PATH,
  FILE_SENTENCES_PATH,
  MAX_ANNOUNCE_SENTENCES,
  RETROSPECTIVE_MS,
  ExitCode
} = require(`../../constants`);

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.trim().split(`\n`).map((el) => el.trim()).filter(Boolean);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const generateRecords = (count, titles, categories, sentences) => (
  Array(count).fill({}).map(() => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    createdDate: new Date(Date.now() - getRandomInt(0, RETROSPECTIVE_MS)),
    announce: shuffle(sentences).slice(0, getRandomInt(1, MAX_ANNOUNCE_SENTENCES)).join(` `),
    fullText: shuffle(sentences).slice(0, getRandomInt(1, sentences.length - 1)).join(` `),
    category: shuffle(categories).slice(0, getRandomInt(1, categories.length - 1)),
  }))
);

module.exports = {
  name: `--generate`,
  async run(args) {
    const [count] = args;
    const recordCount = Number.parseInt(count, 10) || DEFAULT_COUNT;

    if (recordCount > MAX_COUNT) {
      console.error(chalk.red(`Attention! No more than ${MAX_COUNT} records`));
      process.exit(ExitCode.error);
    }

    const titles = await readContent(FILE_TITLES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);
    const sentences = await readContent(FILE_SENTENCES_PATH);

    const content = JSON.stringify(generateRecords(recordCount, titles, categories, sentences));

    try {
      await fs.writeFile(FILE_NAME, content);
      console.info(chalk.green(`File was created.`));
      process.exit(ExitCode.success);
    } catch (e) {
      console.error(chalk.red(`Can't write data to file...`));
      process.exit(ExitCode.error);
    }
  }
};
