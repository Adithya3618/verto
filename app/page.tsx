import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Layers, Users, Zap, CheckCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Trello Clone</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-balance lg:text-6xl">
          Organize your work
          <br />
          <span className="text-primary">with visual boards</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground text-pretty">
          Collaborate with your team using kanban boards. Track tasks, manage projects, and boost productivity with an
          intuitive drag-and-drop interface.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8">
              Get started free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent">
              View demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Visual Boards</h3>
            <p className="text-muted-foreground">
              Organize tasks with customizable boards, lists, and cards. See your work at a glance.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Invite team members, assign tasks, and collaborate in real-time on shared boards.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Boost Productivity</h3>
            <p className="text-muted-foreground">
              Track progress, set due dates, and keep everyone aligned on project goals.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-12">
          <CheckCircle className="mx-auto mb-6 h-12 w-12 text-primary" />
          <h2 className="mb-4 text-3xl font-bold text-balance">Ready to get organized?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join teams around the world using visual boards to manage their work.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8">
              Start for free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Trello Clone. Built with Next.js and SQLAlchemy.</p>
        </div>
      </footer>
    </div>
  )
}
