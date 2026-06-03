interface FeedbackMessageProps {
  errorMessage: string | null;
  successMessage: string | null;
}

export function FeedbackMessage({ errorMessage, successMessage }: FeedbackMessageProps) {
  const message = successMessage ?? errorMessage;

  if (!message) {
    return null;
  }

  return (
    <div
      className={successMessage ? 'feedback-message feedback-success' : 'feedback-message'}
      role="status"
    >
      {message}
    </div>
  );
}
