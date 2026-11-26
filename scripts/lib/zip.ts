// Minimal deterministic ZIP writer/reader (deflate, no extra fields, fixed timestamp) for SCORM packages.
// Same input bytes → same archive bytes, so a package's sha256 changes only when its content does.
import zlib from 'node:zlib';

const DOS_TIME=0, DOS_DATE=(0<<9)|(1<<5)|1; // 1980-01-01 00:00
export interface ZipEntry { name:string; data:Buffer }

export function writeZip(entries:readonly ZipEntry[]):Buffer{
  const locals:Buffer[]=[], centrals:Buffer[]=[]; let offset=0;
  for(const e of entries){
    if(!/^[A-Za-z0-9._\-/]+$/.test(e.name)||e.name.startsWith('/')||e.name.split('/').includes('..')) throw new Error(`ZIP_NAME_INVALID:${e.name}`);
    const name=Buffer.from(e.name,'utf8'), crc=zlib.crc32(e.data)>>>0, packed=zlib.deflateRawSync(e.data,{level:9});
    const lh=Buffer.alloc(30); lh.writeUInt32LE(0x04034b50,0); lh.writeUInt16LE(20,4); lh.writeUInt16LE(0x0800,6); lh.writeUInt16LE(8,8);
    lh.writeUInt16LE(DOS_TIME,10); lh.writeUInt16LE(DOS_DATE,12); lh.writeUInt32LE(crc,14); lh.writeUInt32LE(packed.length,18); lh.writeUInt32LE(e.data.length,22); lh.writeUInt16LE(name.length,26);
    const ch=Buffer.alloc(46); ch.writeUInt32LE(0x02014b50,0); ch.writeUInt16LE(20,4); ch.writeUInt16LE(20,6); ch.writeUInt16LE(0x0800,8); ch.writeUInt16LE(8,10);
    ch.writeUInt16LE(DOS_TIME,12); ch.writeUInt16LE(DOS_DATE,14); ch.writeUInt32LE(crc,16); ch.writeUInt32LE(packed.length,20); ch.writeUInt32LE(e.data.length,24); ch.writeUInt16LE(name.length,28); ch.writeUInt32LE(offset,42);
    locals.push(lh,name,packed); centrals.push(ch,name); offset+=30+name.length+packed.length;
  }
  const cd=Buffer.concat(centrals);
  const end=Buffer.alloc(22); end.writeUInt32LE(0x06054b50,0); end.writeUInt16LE(entries.length,8); end.writeUInt16LE(entries.length,10); end.writeUInt32LE(cd.length,12); end.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,cd,end]);
}

/** Reads what writeZip writes (and any plain deflate/stored archive without zip64); verifies every CRC. */
export function readZip(buf:Buffer):ZipEntry[]{
  const eocd=buf.lastIndexOf(Buffer.from([0x50,0x4b,0x05,0x06]));
  if(eocd<0) throw new Error('ZIP_EOCD_MISSING');
  const count=buf.readUInt16LE(eocd+10); let p=buf.readUInt32LE(eocd+16); const out:ZipEntry[]=[];
  for(let i=0;i<count;i++){
    if(buf.readUInt32LE(p)!==0x02014b50) throw new Error('ZIP_CENTRAL_INVALID');
    const method=buf.readUInt16LE(p+10), crc=buf.readUInt32LE(p+16), csize=buf.readUInt32LE(p+20), n=buf.readUInt16LE(p+28), x=buf.readUInt16LE(p+30), c=buf.readUInt16LE(p+32), lo=buf.readUInt32LE(p+42);
    const name=buf.subarray(p+46,p+46+n).toString('utf8');
    const start=lo+30+buf.readUInt16LE(lo+26)+buf.readUInt16LE(lo+28), raw=buf.subarray(start,start+csize);
    const data=method===8?zlib.inflateRawSync(raw):method===0?Buffer.from(raw):(()=>{throw new Error(`ZIP_METHOD_UNSUPPORTED:${method}`);})();
    if((zlib.crc32(data)>>>0)!==crc) throw new Error(`ZIP_CRC_MISMATCH:${name}`);
    out.push({name,data}); p+=46+n+x+c;
  }
  return out;
}
