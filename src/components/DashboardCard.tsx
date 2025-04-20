// components/DashboardCard.tsx
import { useRouter } from "next/navigation";

export default function DashboardCard({
  title,
  icon,
  stats,
  children,
  link,
}: {
  title: string;
  icon?: React.ReactNode;
  stats?: string[];
  children?: React.ReactNode;
  link?: string;
}) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {icon} {title}
        </h2>
      </div>
      {stats?.map((stat, i) => (
        <p key={i} className="text-sm text-gray-600">
          {stat}
        </p>
      ))}
      {children}
      {link && (
        <button
          className="mt-4 text-blue-500 hover:underline"
          onClick={() => router.push(link)}
        >
          View Detail →
        </button>
      )}
    </div>
  );
}
