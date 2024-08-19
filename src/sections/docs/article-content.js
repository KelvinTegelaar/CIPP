import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { codeStyle } from '../../utils/code-style';

const Code = (props) => {
  const { node, inline, className, children, ...other } = props;

  const language = /language-(\w+)/.exec(className || '');

  return !inline && language
    ? (
      <SyntaxHighlighter
        children={String(children).replace(/\n$/, '')}
        language={language[1]}
        PreTag="div"
        style={codeStyle}
        {...other} />
    )
    : (
      <code
        className={className}
        {...other}>
        {children}
      </code>
    );
};

const Link = (props) => {
  const { href, children } = props;

  if (!href?.startsWith('http')) {
    return (
      <a href={href}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      rel="nofollow noreferrer noopener"
      target="_blank"
    >
      {children}
    </a>
  );
};

const components = {
  link: Link,
  code: Code
};

const ArticleContentRoot = styled('div')(({ theme }) => ({
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.text.secondary}`,
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    '& > p': {
      color: theme.palette.text.secondary,
      marginBottom: 0
    }
  },
  '& code': {
    color: theme.palette.primary.main,
    fontFamily: 'Inconsolata, Monaco, Consolas, \'Courier New\', Courier, monospace',
    fontSize: 14,
    paddingLeft: 2,
    paddingRight: 2
  },
  '& h1': {
    fontSize: 35,
    fontWeight: 500,
    letterSpacing: '-0.24px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(6)
  },
  '& h2': {
    fontSize: 29,
    fontWeight: 500,
    letterSpacing: '-0.24px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(6)
  },
  '& h3': {
    fontSize: 24,
    fontWeight: 500,
    letterSpacing: '-0.06px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(6)
  },
  '& h4': {
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: '-0.06px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(4)
  },
  '& h5': {
    fontSize: 16,
    fontWeight: 500,
    letterSpacing: '-0.05px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  '& h6': {
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '-0.05px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  '& li': {
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4)
  },
  '& p': {
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: theme.spacing(2),
    '& > a': {
      color: theme.palette.primary.main
    }
  }
}));

export const ArticleContent = (props) => {
  const { content } = props;

  return (
    <ArticleContentRoot>
      <Markdown
        children={content}
        components={components}
      />
    </ArticleContentRoot>
  );
};

ArticleContent.propTypes = {
  content: PropTypes.string.isRequired
};
