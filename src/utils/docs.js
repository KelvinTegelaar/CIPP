import { lstatSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const docsDir = join(process.cwd(), 'docs');

export const getArticle = (slug, fields = []) => {
  const filePath = join(docsDir, `${slug}.md`);
  const fileData = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileData);

  const article = {};

  fields.forEach((field) => {
    if (field === 'slug') {
      article[field] = slug;
    }

    if (field === 'content') {
      article[field] = content;
    }

    if (typeof data[field] !== 'undefined') {
      article[field] = data[field];
    }
  });

  return article;
};

export const getArticles = (fields = []) => {
  // Read all files recursively from docs directory
  const filePaths = readdirSync(docsDir).filter((item) => {
    const currPath = join(docsDir, item);
    return !lstatSync(currPath).isDirectory();
  });

  return filePaths.map((filePath) => getArticle(filePath.replace(/\.md$/, ''), fields));
};
