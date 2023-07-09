import Head from "next/head";

import styles from "./styles.module.css";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>My Tasks Panel</title>
      </Head>

      <h1>My Panel</h1>
    </div>
  );
}
