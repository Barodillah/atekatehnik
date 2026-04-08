const fs = require('fs');
const file = 'c:\\laragon\\www\\atekatehnik\\src\\pages\\ProductDetail.jsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const \[imageRatio.+/, '');

c = c.replace(/catch \(err\) \{/g, 'catch (error) {');

c = c.replace(/fetchRelated\(\);\s*\}, \[product\]\);\s*\n\s*if \(loading\) \{/,
`fetchRelated();
    }, [product]);

    useEffect(() => {
        if (!product) return;
        const fetchRelatedPosts = async () => {
            try {
                const res = await fetch(\`/api/posts.php?lang=\${lang}&sort=views_asc&limit=2\`);
                const data = await res.json();
                if (data.success && data.posts) {
                    setRelatedPosts(data.posts.slice(0, 2));
                }
            } catch (error) {
                console.error("Failed to fetch related posts");
            }
        };
        fetchRelatedPosts();
    }, [lang, product]);

    if (loading) {`
);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed relatedPosts');
