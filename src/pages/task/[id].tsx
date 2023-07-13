import { useState, ChangeEvent, FormEvent } from "react";

import Head from "next/head";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";

import { Textarea } from "@/components/Textarea";

import { db } from "@/services/firebase";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  addDoc,
} from "firebase/firestore";

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
  const [input, setInput] = useState("");

  const { data: session } = useSession();

  async function handleComment(e: FormEvent) {
    try {
      e.preventDefault();

      if (!input) {
        alert("You cannot register an empty comment!");
        return;
      }

      const docRef = await addDoc(collection(db, "comment"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.id,
      });

      setInput("");
    } catch (e) {
      console.error("handleComment Error: ", e);
      alert("Error while registering comment! Try again later.");
    }
  }

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

        <form onSubmit={handleComment}>
          <Textarea
            placeholder="Write your comment..."
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
          />

          <button className={styles.button} disabled={!session?.user}>
            Comment
          </button>
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
