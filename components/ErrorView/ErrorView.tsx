import css from './ErrorView.module.css';

interface ErrorViewProps {
  message: string;
}

export default function ErrorView({ message }: ErrorViewProps) {
  return <div className={css.container}>{message}</div>;
}
