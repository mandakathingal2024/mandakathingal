import { ViewFamily } from "@/components/members/ViewFamily";


export default function Home({params}) {
  console.log(params.id);
    return (
      <>
        <main id="main">
          <ViewFamily id={params.id}/>
        </main>
      </>
    );
  }