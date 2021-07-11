function readHeader(headers, key) {
  const filteredheaders = headers.filter(item => item.key === key);

  if (
    filteredheaders &&
    filteredheaders[0] && 
    typeof filteredheaders[0].value === 'string'
  ) {
    return filteredheaders[0].value.trim();
  }
  return null;
}

function setHeader(headers, key, value) {
  const filteredheaders = headers.filter(item => {
    item.key === key
  });

  if (
    filteredheaders &&
    filteredheaders[0]
  ) {
    filteredheaders[0].value = value;
  }

  headers.push({key,value});
  return true;
}



module.exports = {
  readHeader,
  setHeader
}