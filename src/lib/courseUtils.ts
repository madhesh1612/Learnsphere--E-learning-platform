export function formatDuration(minutes: number | null): string {
    if (!minutes) return '0m';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    return `${mins}m`;
}

export function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        textArea.remove();
        return Promise.resolve();
    } catch (error) {
        textArea.remove();
        return Promise.reject(error);
    }
}

export function getCourseUrl(courseId: string): string {
    return `${window.location.origin}/courses/${courseId}`;
}
