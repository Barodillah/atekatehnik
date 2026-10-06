const fs = require('fs');

const md = fs.readFileSync('table_schema.md', 'utf-8');
const lines = md.split('\n');

let sql = '';
let currentTable = null;
const tables = {};

lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('## ')) {
        currentTable = line.replace('## ', '').replace(/`/g, '').trim();
        tables[currentTable] = [];
    } else if (line.startsWith('|') && !line.startsWith('| # |') && !line.startsWith('|---|')) {
        if (currentTable) {
            const parts = line.split('|').map(p => p.trim()).slice(1, -1);
            if (parts.length >= 7) {
                tables[currentTable].push({
                    col: parts[1].replace(/`/g, ''),
                    type: parts[2].replace(/`/g, ''),
                    null: parts[3],
                    key: parts[4],
                    default: parts[5],
                    extra: parts[6]
                });
            }
        }
    }
});

for (const [table, cols] of Object.entries(tables)) {
    sql += `CREATE TABLE \`${table}\` (\n`;
    const colDefs = [];
    const primaries = [];
    const uniques = [];
    const indexes = [];

    cols.forEach(c => {
        let colSql = `  \`${c.col}\` ${c.type}`;
        if (c.null === 'NO') colSql += ' NOT NULL';
        
        if (c.default !== '-' && c.default !== 'NULL') {
            if (c.default.toLowerCase() === 'current_timestamp()') {
                colSql += ' DEFAULT CURRENT_TIMESTAMP';
            } else {
                colSql += ` DEFAULT ${c.default}`;
            }
        } else if (c.default === 'NULL' && c.null === 'YES') {
            colSql += ' DEFAULT NULL';
        }

        if (c.extra.includes('auto_increment')) colSql += ' AUTO_INCREMENT';
        if (c.extra.includes('on update current_timestamp()')) colSql += ' ON UPDATE CURRENT_TIMESTAMP';

        colDefs.push(colSql);

        if (c.key === 'PRI') primaries.push(`\`${c.col}\``);
        else if (c.key === 'UNI') uniques.push(`\`${c.col}\``);
        else if (c.key === 'MUL') indexes.push(`\`${c.col}\``);
    });

    if (primaries.length) colDefs.push(`  PRIMARY KEY (${primaries.join(', ')})`);
    uniques.forEach(u => colDefs.push(`  UNIQUE KEY \`idx_${table}_${u.replace(/`/g, '')}\` (${u})`));
    indexes.forEach(idx => colDefs.push(`  KEY \`idx_${table}_${idx.replace(/`/g, '')}\` (${idx})`));

    sql += colDefs.join(',\n') + `\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;
}

fs.writeFileSync('schema.sql', sql);
