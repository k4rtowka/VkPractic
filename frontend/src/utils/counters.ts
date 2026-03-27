export const pluralRu = (
  n: number,
  one: string,
  few: string,
  many: string,
): string => {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
};

export const questionsLabel = (count: number): string => {
  return `${count} ${pluralRu(count, 'вопрос', 'вопроса', 'вопросов')}`;
};

export const participantsLabel = (count: number): string => {
  return `${count} ${pluralRu(count, 'участник', 'участника', 'участников')}`;
};
