interface SectionHeaderProps {
    label: string;          // overline, all-caps
    title: string;
    description?: string;
    align?: "left" | "center";
}

export function SectionHeader({
    label,
    title,
    description,
    align = "left",
}: SectionHeaderProps) {
    const textAlign = align === "center" ? "text-center" : "text-left";
    const maxWidth = align === "center" ? "max-w-2xl mx-auto" : "";

    return (
        <div className={`${textAlign} ${maxWidth}`}>
            <p className="overline mb-3">{label}</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-text-primary">
                {title}
            </h2>
            {description && (
                <p className="text-sm leading-relaxed max-w-lg text-text-secondary">
                    {description}
                </p>
            )}
        </div>
    );
}
