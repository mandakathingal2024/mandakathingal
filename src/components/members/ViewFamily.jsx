'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../context/firebaseConfig'
import { ViewFamilySkeleton } from '../Skeleton'


export const ViewFamily = ({ id }) => {
    const { viewFamilyData, getMembersByRelatedTo, memberObj, getMemberById, isGmailAuthenticated } = useStateContext()
    const [isLoading, setIsLoading] = useState(true);
    const [breadcrumbChain, setBreadcrumbChain] = useState([]);
    const router = useRouter();

    const [error, setError] = useState(null);

    // Build breadcrumb chain by walking up parent tree
    async function buildBreadcrumbChain(memberId) {
        const chain = [];
        let currentId = memberId;
        let maxDepth = 10; // safety limit

        while (currentId && maxDepth > 0) {
            maxDepth--;
            const membersRef = collection(db, "members");
            const q = query(membersRef, where("id", "==", currentId));
            const snap = await getDocs(q);

            if (snap.size > 0) {
                const data = snap.docs[0].data();
                chain.unshift({ id: data.id, name: data.name });

                // Only walk up if this member is a child (Son/Daughter)
                if (data.relatedTo && data.relation === "Son Of / Dauhter Of") {
                    currentId = data.relatedTo;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return chain;
    }

    useEffect(() => {
        setIsLoading(true);
        setBreadcrumbChain([]);
        const fetchData = async () => {
            try {
                const response1 = await getMemberById(id)
                const response2 = await getMembersByRelatedTo(id);
                const chain = await buildBreadcrumbChain(id);
                setBreadcrumbChain(chain);
            } catch (error) {
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) {
        return <ViewFamilySkeleton />
    }

    return (
        <>
        <section id="breadcrumbs" className="breadcrumbs">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    <h2>{memberObj?.name || 'Family'}</h2>
                    <ol>
                        <li><a href="/">Home</a></li>
                        <li><a href="/members">Members</a></li>
                        {breadcrumbChain.map((crumb, index) => (
                            <li key={crumb.id}>
                                {index < breadcrumbChain.length - 1 ? (
                                    <a href={`/members/${crumb.id}`}>{crumb.name}</a>
                                ) : (
                                    crumb.name
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
        <section id="about" className="about" style={{ padding: '10px 0px' }}>
            <div className="container">
                <div className="row content" >
                    <div className="col-lg-6 pt-4 pt-lg-0" >
                        <section id="features" className="features" style={{ padding: '0px' }}>
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-5 col-md-5 col-6 icon-box">
                                        <div className="icon-small-1"><Image width={150} height={200} src={memberObj?.memberImgUrl ? memberObj?.memberImgUrl : '/default-avatar.svg'} alt="" /></div>
                                        <h4 className="title">{memberObj?.name}</h4>
                                        <p className="description">{memberObj?.place}</p>
                                    </div>
                                    {viewFamilyData && viewFamilyData.map((member) => {
                                        if (member.relation === "Wife Of / Husband Of") {
                                            return (
                                                <div className="col-lg-5 col-md-5 col-6 icon-box" key={member.id}>
                                                    <div className="icon-small-1"> <Image width={150} height={200} src={member.memberImgUrl ? member.memberImgUrl : '/default-avatar.svg'} alt="image not available" /> </div>
                                                    <h4 className="title">{member.name}</h4>
                                                    <p className="description">{member.place}</p>
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                                {memberObj?.description && (
                                    <div className="row">
                                        <div className="section-title">
                                            <p>{memberObj?.description}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                     <div className="col-lg-6 about-img" style={{ marginBottom: '20px', borderWidth:'5px' }}>
                        <Image src={memberObj?.houseImgUrl? memberObj?.houseImgUrl : '/home.png'} width={600} height={400} layout='intrinsic' alt="house image" style={{ borderRadius: '20px', width: '100%', height: 'auto' }} />
                    </div>
                    <hr />
                    <section id="features" className="features" style={{ padding: '20px 0px' }}>
                        <div className="container">
                            <div className="row">
                                {viewFamilyData && viewFamilyData.map((member) => {
                                    if (member.relation === "Late Parent / Additional Member") {
                                        return (
                                            <div className="col-lg-3 col-md-4 col-6 icon-box" key={member.id}>
                                                <div className="icon-small"><Image width={120} height={165} src={member.memberImgUrl ? member.memberImgUrl : '/default-avatar.svg'} alt="" /></div>
                                                <h4 className="title">{member.name}</h4>
                                                {member.place && <p className="description">{member.place}</p>}
                                                {member.description && <p className="description">{member.description}</p>}
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                        </div>
                    </section>
                    <hr />
                    <section id="features" className="features" style={{ padding: '20px 0px' }}>
                        <div className="container">
                            <div className="section-title">
                                <h2>Children</h2>
                            </div>
                            <div className="row">
                                {viewFamilyData && viewFamilyData.map((member) => {
                                    if (member.relation === "Son Of / Dauhter Of") {
                                        return (
                                            <div className="col-lg-3 col-md-4 col-6 icon-box" key={member.id}>
                                                <div className="icon-small"><Image width={120} height={165} src={member.memberImgUrl ? member.memberImgUrl : '/default-avatar.svg'} alt="" /></div>
                                                <h4 className="title">{member.name}</h4>
                                                <a href={`/members/${member.id}`} className="btn-learn-more" >View Family</a>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </section>
        </>
    )
}
