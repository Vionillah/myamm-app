export const metadata = {
  title: 'Chapter Documents',
}
const ChaptersLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="py-10 px-10">
      {children}
    </div>
  );
}
export default ChaptersLayout;