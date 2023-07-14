import { useState, ChangeEvent, FormEvent } from "react";

import Head from "next/head";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";

import { Textarea } from "@/components/Textarea";

import { FaTrash } from "react-icons/fa";

import { db } from "@/services/firebase";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

import styles from "./styles.module.css";

interface CommentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

interface TaskProps {
  item: {
    id: string;
    task: string;
    created: string;
    public: boolean;
    user: string;
  };

  allComments: CommentProps[];
}

export default function Task({ item, allComments }: TaskProps) {
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<CommentProps[]>(allComments || []);

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

      const newComment = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email || "",
        name: session?.user?.name || "",
        taskId: item?.id,
      };

      setComments((prev) => [...prev, newComment]);
      setInput("");
    } catch (e) {
      console.error("handleComment Error: ", e);
      alert("Error while registering comment! Try again later.");
    }
  }

  async function hadleDeleteComment(id: string) {
    try {
      const docRef = doc(db, "comment", id);
      await deleteDoc(docRef);

      const newComments = comments.filter((comment) => comment.id !== id);

      setComments(newComments);

      alert("Comment deleted!");
    } catch (e) {
      console.error("handleDeleteComment Error: ", e);
      alert("Error while deleting comment! Try again later.");
    }
  }

  function showComments() {
    return comments.map(({ id, name, user, comment }) => (
      <article key={id} className={styles.comment}>
        <div className={styles.headComment}>
          <label className={styles.commentLabel}>{name}</label>

          {user === session?.user?.email && (
            <button
              className={styles.trashButton}
              onClick={() => hadleDeleteComment(id)}
            >
              <FaTrash size={18} color="var(--red)" />
            </button>
          )}
        </div>

        <p>{comment}</p>
      </article>
    ));
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
            placeholder={
              !session
                ? "Log in to leave a comment..."
                : "Write your comment..."
            }
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            disabled={!session}
          />

          <button className={styles.button} disabled={!session?.user}>
            Comment
          </button>
        </form>
      </section>

      <section className={styles.commentsContainer}>
        <h2>All Comments</h2>

        {comments.length <= 0 && <span>Be the first to comment...</span>}

        {showComments()}
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

  const qry = query(collection(db, "comment"), where("taskId", "==", id));
  const comments = await getDocs(qry);

  let allComments: CommentProps[] = [];

  comments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
  });

  return {
    props: {
      item: task,
      allComments: allComments,
    },
  };
};
