function truncateText(text, maxLength) {
  const plainText = text.replace(/[#*_`>-]/g, "");

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + "...";
}

export default truncateText;
