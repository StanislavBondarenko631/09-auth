import css from './Loader.module.css';

export default function Loader() {
  return (
    <div className={css.container}>
      <div className={css.spinner}></div>
      <p>Loading notes, please wait...</p>
    </div>
  );
}
