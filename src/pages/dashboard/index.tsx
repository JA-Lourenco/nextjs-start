import { useState, ChangeEvent, FormEvent } from "react";

import Head from "next/head";

import { Textarea } from "@/components/Textarea";

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

import { db } from "@/services/firebase";
import { addDoc, collection } from "firebase/firestore";

import styles from "./styles.module.css";

interface DashboardProps {
  user: {
    email: string;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);

  function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
    setPublicTask(e.target.checked);
  }

  async function handleRegisterTask(e: FormEvent) {
    try {
      e.preventDefault();

      if (!input) {
        alert("Please enter");
        return;
      }

      await addDoc(collection(db, "task"), {
        task: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });

      setInput("");
      setPublicTask(false);
    } catch (e) {
      console.error("handleRegisterTask Error: ", e);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>My Tasks Panel</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>What's your task?</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Write about your task..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />

              <div className={styles.checkboxArea}>
                <input
                  id="markPublic"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label htmlFor="markPublic">Mark as public</label>
              </div>

              <button type="submit" className={styles.button}>
                Register
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>My Tasks</h1>

          <article className={styles.task}>
            <div className={styles.tagContainer}>
              <label className={styles.tag}>PUBLIC</label>

              <button type="button" className={styles.shareButton}>
                <FiShare2 size={22} color="var(--blue)" />
              </button>
            </div>

            <div className={styles.taskContent}>
              <p>my fiurst task example</p>

              <button type="button" className={styles.trashButton}>
                <FaTrash size={24} color="var(--red)" />
              </button>
            </div>
          </article>
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
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
