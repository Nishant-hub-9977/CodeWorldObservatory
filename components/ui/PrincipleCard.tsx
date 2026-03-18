interface PrincipleCardProps {
    icon: string;
    title: string;
    description: string;
    index: number;
}

export function PrincipleCard({ icon, title, description, index }: PrincipleCardProps) {
    return (
        <article
            className="obs-panel group flex flex-col gap-4 animate-slide-up"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
        >
            <div className="flex items-center justify-between">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded border border-accent/15 bg-accent-soft text-xl font-bold text-accent"
                >
                    {icon}
                </div>
                <span className="text-xs font-mono text-text-muted">
                    {String(index + 1).padStart(2, "0")}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-text-primary">
                    {title}
                </h3>
                <p className="text-xs leading-relaxed text-text-secondary">
                    {description}
                </p>
            </div>
        </article>
    );
}
