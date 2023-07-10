import Head from "next/head";

import { Textarea } from "@/components/Textarea";

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import styles from "./styles.module.css";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>My Tasks Panel</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>What's your task?</h1>

            <form>
              <Textarea placeholder="Write about your task..." />

              <div className={styles.checkboxArea}>
                <input
                  id="markPublic"
                  type="checkbox"
                  className={styles.checkbox}
                />
                <label htmlFor="markPublic">Mark as public</label>
              </div>

              <button type="submit" className={styles.button}>
                Register
              </button>
            </form>
          </div>
        </section>
      </main>
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
