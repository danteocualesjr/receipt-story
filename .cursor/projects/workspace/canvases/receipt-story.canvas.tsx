import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  CollapsibleSection,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Link,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  computeDAGLayout,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type SectionId =
  | "overview"
  | "architecture"
  | "flow"
  | "api"
  | "data"
  | "setup"
  | "files";

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "flow", label: "User flow" },
  { id: "api", label: "API" },
  { id: "data", label: "Data model" },
  { id: "setup", label: "Setup" },
  { id: "files", label: "File map" },
];

function ArchitectureDiagram() {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    nodes: [
      { id: "browser" },
      { id: "page" },
      { id: "route" },
      { id: "demo" },
      { id: "openai" },
      { id: "card" },
    ],
    edges: [
      { from: "browser", to: "page" },
      { from: "page", to: "route" },
      { from: "route", to: "demo" },
      { from: "route", to: "openai" },
      { from: "demo", to: "card" },
      { from: "openai", to: "card" },
    ],
    nodeWidth: 148,
    nodeHeight: 36,
    rankGap: 56,
    nodeGap: 40,
  });

  const labels: Record<string, string> = {
    browser: "Browser",
    page: "app/page.tsx",
    route: "POST /api/story",
    demo: "lib/demo.ts",
    openai: "lib/openai.ts",
    card: "MemoryCard",
  };

  return (
    <svg
      width={layout.width}
      height={layout.height}
      role="img"
      aria-label="Receipt Story architecture diagram"
    >
      {layout.edges.map((edge) => (
        <line
          key={`${edge.from}-${edge.to}`}
          x1={edge.sourceX}
          y1={edge.sourceY}
          x2={edge.targetX}
          y2={edge.targetY}
          stroke={theme.stroke.secondary}
          strokeWidth={1.5}
        />
      ))}
      {layout.nodes.map((node) => (
        <g key={node.id}>
          <rect
            x={node.x}
            y={node.y}
            width={148}
            height={36}
            rx={6}
            fill={theme.fill.secondary}
            stroke={theme.stroke.primary}
          />
          <text
            x={node.x + 74}
            y={node.y + 22}
            textAnchor="middle"
            fill={theme.text.primary}
            fontSize={11}
            fontFamily="ui-monospace, monospace"
          >
            {labels[node.id] ?? node.id}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SectionNav({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <Row gap={8} wrap>
      {SECTIONS.map((section) => (
        <Pill
          key={section.id}
          active={active === section.id}
          onClick={() => onSelect(section.id)}
        >
          {section.label}
        </Pill>
      ))}
    </Row>
  );
}

function OverviewSection() {
  return (
    <Stack gap={16}>
      <Card>
        <CardHeader trailing="Hackathon MVP">Receipt → Story</CardHeader>
        <CardBody>
          <Text>
            Turn a receipt photo into a one-line journal memory. Upload an image,
            vision AI reads the merchant and amount, and returns a warm story
            line you can copy and keep.
          </Text>
        </CardBody>
      </Card>
      <Grid columns={3} gap={16}>
        <Stat value="Next.js 15" label="App Router" />
        <Stat value="1" label="API route" tone="info" />
        <Stat value="Demo-safe" label="No API key required" tone="success" />
      </Grid>
      <Callout tone="info" title="Audience">
        Hackathon demos, quick local runs, and anyone evaluating the vision
        pipeline without provisioning OpenAI first.
      </Callout>
    </Stack>
  );
}

function ArchitectureSection() {
  return (
    <Stack gap={16}>
      <Text tone="secondary">
        Single-page client UI posts multipart form data to one server route.
        The route either returns a canned demo story or forwards the image to
        OpenAI vision.
      </Text>
      <ArchitectureDiagram />
      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Client</CardHeader>
          <CardBody>
            <Text size="small">
              <Code>app/page.tsx</Code> handles drag-and-drop upload, theme
              toggle, loading skeleton, and copy-to-clipboard. Validates image
              type and 8 MB limit before posting.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Server</CardHeader>
          <CardBody>
            <Text size="small">
              <Code>app/api/story/route.ts</Code> accepts{" "}
              <Code>receipt</Code> file or <Code>demo=true</Code>. Falls back
              to demo when no <Code>OPENAI_API_KEY</Code> is set.
            </Text>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}

function FlowSection() {
  return (
    <Stack gap={12}>
      <Table
        headers={["Step", "What happens", "Source"]}
        rows={[
          [
            "1. Upload",
            "User drops or picks a receipt image (JPEG, PNG, WebP, max 8 MB)",
            "app/page.tsx",
          ],
          [
            "2. Preview",
            "Client creates an object URL for the receipt thumbnail",
            "app/page.tsx",
          ],
          [
            "3. POST",
            "FormData with receipt file sent to /api/story",
            "fetch('/api/story')",
          ],
          [
            "4. Vision",
            "Server base64-encodes image and calls gpt-4o-mini with JSON schema",
            "lib/openai.ts",
          ],
          [
            "5. Render",
            "MemoryCard shows story, merchant, amount, date, and preview",
            "MemoryCard.tsx",
          ],
          [
            "Demo path",
            "Try demo story skips upload; returns Midnight Ramen sample",
            "lib/demo.ts",
          ],
        ]}
        striped
      />
      <Callout tone="neutral" title="Demo fallback">
        Clicking <Text as="span" weight="semibold">Try demo story</Text> or
        running without an API key always returns the canned ramen memory — no
        network call to OpenAI.
      </Callout>
    </Stack>
  );
}

function ApiSection() {
  return (
    <Stack gap={16}>
      <H3>POST /api/story</H3>
      <Text>
        Accepts <Code>multipart/form-data</Code>. Returns JSON{" "}
        <Code>MemoryStory</Code> or an error object.
      </Text>
      <Table
        headers={["Field", "Type", "Required", "Description"]}
        rows={[
          ["receipt", "File", "For real receipts", "Image file (image/*)"],
          ["demo", "string", "Optional", "Set to true for demo story"],
        ]}
      />
      <H3>Responses</H3>
      <Table
        headers={["Status", "Body", "When"]}
        rows={[
          ["200", "MemoryStory JSON", "Success or demo"],
          ["400", '{ error: "..." }', "Missing file, wrong type, or too large'],
          ["500", '{ error: "..." }', "OpenAI failure or unexpected error"],
        ]}
        rowTone={[undefined, "warning", "danger"]}
      />
      <CollapsibleSection title="OpenAI prompt contract" defaultOpen={false}>
        <Text size="small" tone="secondary">
          System prompt in <Code>lib/openai.ts</Code> requests JSON with keys:
          merchant, amount, date, category, emoji, storyLine. Uses{" "}
          <Code>response_format: json_object</Code> and{" "}
          <Code>gpt-4o-mini</Code> by default (override via OPENAI_MODEL).
        </Text>
      </CollapsibleSection>
    </Stack>
  );
}

function DataSection() {
  return (
    <Stack gap={16}>
      <Text>
        All story payloads conform to <Code>MemoryStory</Code> in{" "}
        <Code>lib/types.ts</Code>.
      </Text>
      <Table
        headers={["Field", "Type", "Example"]}
        rows={[
          ["merchant", "string", "Midnight Ramen Co."],
          ["amount", "string", "$24.50"],
          ["date", "string", "Tuesday, Mar 12"],
          ["category", "string", "Food & friends"],
          ["emoji", "string", "Single emoji"],
          ["storyLine", "string", "One past-tense journal sentence"],
          ["demo", "boolean?", "true when demo fallback used"],
        ]}
      />
      <Card>
        <CardHeader>Demo story sample</CardHeader>
        <CardBody>
          <Text italic tone="secondary">
            Tuesday night: ramen with Alex after the bad meeting — the kind of
            meal that fixes nothing official but everything else.
          </Text>
          <Text size="small" tone="tertiary">
            Midnight Ramen Co. · $24.50 · Tuesday, Mar 12
          </Text>
        </CardBody>
      </Card>
    </Stack>
  );
}

function SetupSection() {
  return (
    <Stack gap={16}>
      <H3>Run locally</H3>
      <Text>
        Run <Code>npm install</Code> then <Code>npm run dev</Code>. Open{" "}
        <Link href="http://localhost:3000">http://localhost:3000</Link>.
      </Text>
      <H3>Real receipts</H3>
      <Table
        headers={["Variable", "Required", "Default"]}
        rows={[
          ["OPENAI_API_KEY", "For real OCR", "—"],
          ["OPENAI_MODEL", "Optional", "gpt-4o-mini"],
        ]}
      />
      <Text size="small" tone="secondary">
        Copy <Code>.env.example</Code> to <Code>.env.local</Code> and add your
        key from platform.openai.com.
      </Text>
      <Callout tone="success" title="Demo script">
        Click Try demo story for an instant memory card, or upload any receipt
        image once the API key is configured.
      </Callout>
    </Stack>
  );
}

function FilesSection() {
  return (
    <Table
      headers={["Path", "Role"]}
      rows={[
        ["app/page.tsx", "Main UI: upload, theme, loading, actions"],
        ["app/layout.tsx", "Fonts (DM Sans, Fraunces), theme init script"],
        ["app/globals.css", "Dark/light journal styling"],
        ["app/components/MemoryCard.tsx", "Story card with receipt preview"],
        ["app/api/story/route.ts", "POST handler: demo or vision"],
        ["lib/openai.ts", "OpenAI vision + JSON parsing"],
        ["lib/demo.ts", "Canned demo MemoryStory"],
        ["lib/types.ts", "MemoryStory type definition"],
      ]}
      striped
      stickyHeader
    />
  );
}

export default function ReceiptStoryDocs() {
  const [activeSection, setActiveSection] = useCanvasState<SectionId>(
    "activeSection",
    "overview",
  );

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Receipt → Story</H1>
        <Text tone="secondary">
          Architecture notes, API reference, and codebase walkthrough for the
          hackathon MVP.
        </Text>
      </Stack>

      <SectionNav active={activeSection} onSelect={setActiveSection} />

      <Divider />

      {activeSection === "overview" ? (
        <Stack gap={12}>
          <H2>Overview</H2>
          <OverviewSection />
        </Stack>
      ) : null}

      {activeSection === "architecture" ? (
        <Stack gap={12}>
          <H2>Architecture</H2>
          <ArchitectureSection />
        </Stack>
      ) : null}

      {activeSection === "flow" ? (
        <Stack gap={12}>
          <H2>User flow</H2>
          <FlowSection />
        </Stack>
      ) : null}

      {activeSection === "api" ? (
        <Stack gap={12}>
          <H2>API reference</H2>
          <ApiSection />
        </Stack>
      ) : null}

      {activeSection === "data" ? (
        <Stack gap={12}>
          <H2>Data model</H2>
          <DataSection />
        </Stack>
      ) : null}

      {activeSection === "setup" ? (
        <Stack gap={12}>
          <H2>Setup & run</H2>
          <SetupSection />
        </Stack>
      ) : null}

      {activeSection === "files" ? (
        <Stack gap={12}>
          <H2>File map</H2>
          <FilesSection />
        </Stack>
      ) : null}

      <Divider />

      <Stack gap={8}>
        <H3>References</H3>
        <Text size="small" tone="secondary">
          README.md · .env.example · OpenAI Chat Completions API (vision)
        </Text>
      </Stack>
    </Stack>
  );
}
