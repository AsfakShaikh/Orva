export default function capitalize(input?: string | null): string {
  if (!input) {
    return '';
  }

  return input
    .replace(/[_-]+/g, ' ') // Replace underscores and hyphens with spaces
    .trim()
    .split(/\s+/) // Split by any whitespace
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function capitalizeFirstLetter(input?: string | null): string {
  if (!input) {
    return '';
  }

  return (
    input.charAt(0).toUpperCase() +
    input
      .slice(1)
      .replace(/[_-]+/g, ' ') // Replace underscores and hyphens with spaces
      .trim()
  );
}
