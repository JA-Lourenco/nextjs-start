import Head from "next/head";
import { GetServerSideProps } from "next";

import { Textarea } from "@/components/Textarea";

import { db } from "@/services/firebase";
import { doc, collection, query, where, getDoc } from "firebase/firestore";

import styles from "./styles.module.css";

interface TaskProps {
  item: {
    id: string;
    task: string;
    created: string;
    public: boolean;
    user: string;
  };
}

export default function Task({ item }: TaskProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Task Details</title>
      </Head>

      <main className={styles.main}>
        <h1>Task</h1>

        <article className={styles.task}>
          <p>{item.task}</p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Leave a comment</h2>

        <form>
          <Textarea placeholder="Write your comment..." />

          <button className={styles.button}>Comment</button>
        </form>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "task", id);

  const snapshot = await getDoc(docRef);

  if (!snapshot.data() || !snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const milliseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    id,
    task: snapshot.data()?.task,
    public: snapshot.data()?.public,
    created: new Date(milliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
  };

  return {
    props: {
      item: task,
    },
  };
};
