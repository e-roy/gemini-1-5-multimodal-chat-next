// app/page.tsx
import { ChatContainer } from "./_components/ChatContainer";
import { GitHubLink } from "./_components/GitHubLink";

export default function Home() {
  return (
    <main className="h-screen max-w-6xl m-auto gap-4 p-2 md:p-4 my-12 md:my-0">
      <GitHubLink />
      <ChatContainer />
    </main>
  );
}
