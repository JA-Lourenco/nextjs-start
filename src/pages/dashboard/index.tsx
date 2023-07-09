import Head from "next/head";

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
